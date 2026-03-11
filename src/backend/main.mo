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
  stable var adminPassword = "admin";

  func isAnonymous(principal : Principal) : Bool {
    principal.isAnonymous();
  };

  func forceSetAdmin(principal : Principal) {
    accessControlState.userRoles.add(principal, #admin);
    accessControlState.adminAssigned := true;
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

    forceSetAdmin(caller);
    adminClaimed := true;
  };

  public query ({ caller }) func isAdmin() : async Bool {
    AccessControl.isAdmin(accessControlState, caller);
  };

  public query func checkAdminPassword(password : Text) : async Bool {
    password == adminPassword;
  };

  public shared ({ caller }) func setAdminPassword(newPassword : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can change the admin password");
    };
    if (newPassword.size() < 4) {
      Runtime.trap("Password must be at least 4 characters");
    };
    adminPassword := newPassword;
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (not Principal.equal(caller, user) and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public shared ({ caller }) func addVideo(title : Text, batchId : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
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
