import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import MixinStorage "blob-storage/Mixin";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);
  include MixinStorage();

  type Video = {
    id : Nat;
    title : Text;
    batchId : Text;
    uploader : Principal;
  };

  public type UserProfile = {
    name : Text;
  };

  let videos = Map.empty<Nat, Video>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  var nextId = 0;
  var adminClaimed = false;
  var adminPassword = "julfiquar";

  // Stable storage for admin principal - persists across upgrades
  var superAdminText : Text = "";

  func isAnonymous(principal : Principal) : Bool {
    principal.isAnonymous();
  };

  // Force set a principal as admin, ensuring any existing role is overwritten
  func forceSetAdmin(principal : Principal) {
    accessControlState.userRoles.remove(principal);
    accessControlState.userRoles.add(principal, #admin);
    accessControlState.adminAssigned := true;
  };

  // Restore stable admin to in-memory map if needed
  func restoreStableAdmin(caller : Principal) {
    if (superAdminText != "" and caller.toText() == superAdminText) {
      switch (accessControlState.userRoles.get(caller)) {
        case (?(#admin)) {};
        case (_) { forceSetAdmin(caller) };
      };
    };
  };

  // Safe admin check that never traps
  func safeIsAdmin(principal : Principal) : Bool {
    switch (accessControlState.userRoles.get(principal)) {
      case (null) { false };
      case (?role) { role == #admin };
    };
  };

  public shared ({ caller }) func claimAdmin() : async () {
    if (isAnonymous(caller)) {
      Runtime.trap("Anonymous principal cannot claim admin role");
    };

    if (adminClaimed) {
      Runtime.trap("Admin has already been claimed");
    };

    forceSetAdmin(caller);
    adminClaimed := true;
  };

  public shared ({ caller }) func resetAndClaimAdmin() : async () {
    if (isAnonymous(caller)) {
      Runtime.trap("Anonymous principal cannot claim admin role");
    };

    // Persist admin principal across upgrades
    superAdminText := caller.toText();
    forceSetAdmin(caller);
    adminClaimed := true;
  };

  // Reliable isAdmin - checks stable storage (survives upgrades) and never traps
  public query ({ caller }) func isAdmin() : async Bool {
    if (superAdminText != "" and caller.toText() == superAdminText) {
      return true;
    };
    safeIsAdmin(caller);
  };

  public query func checkAdminPassword(password : Text) : async Bool {
    password == adminPassword;
  };

  public shared ({ caller }) func setAdminPassword(newPassword : Text) : async () {
    restoreStableAdmin(caller);
    if (not safeIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can change the admin password");
    };
    if (newPassword.size() < 4) {
      Runtime.trap("Password must be at least 4 characters");
    };
    adminPassword := newPassword;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not Principal.equal(caller, user) and not safeIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (isAnonymous(caller)) {
      Runtime.trap("Anonymous principal cannot save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addVideo(title : Text, batchId : Text) : async Nat {
    restoreStableAdmin(caller);
    if (not safeIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can add videos");
    };

    let id = nextId;
    let video : Video = {
      id;
      title;
      batchId;
      uploader = caller;
    };

    videos.add(id, video);
    nextId += 1;
    id;
  };

  public shared ({ caller }) func deleteVideo(id : Nat) : async () {
    restoreStableAdmin(caller);
    if (not safeIsAdmin(caller)) {
      Runtime.trap("Unauthorized: Only admins can delete videos");
    };

    switch (videos.get(id)) {
      case (null) { Runtime.trap("Video not found") };
      case (?_) {
        videos.remove(id);
      };
    };
  };

  public query ({ caller }) func getVideosByBatch(batchId : Text) : async [Video] {
    let result = List.empty<Video>();
    for (video in videos.values()) {
      if (video.batchId == batchId) {
        result.add(video);
      };
    };
    result.toArray();
  };
};
