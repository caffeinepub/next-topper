import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Video {
    id: bigint;
    title: string;
    uploader: Principal;
    batchId: string;
}
export interface UserProfile {
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addVideo(title: string, batchId: string): Promise<bigint>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    checkAdminPassword(password: string): Promise<boolean>;
    claimAdmin(): Promise<void>;
    deleteVideo(id: bigint): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVideosByBatch(batchId: string): Promise<Array<Video>>;
    isAdmin(): Promise<boolean>;
    isCallerAdmin(): Promise<boolean>;
    resetAndClaimAdmin(): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    setAdminPassword(newPassword: string): Promise<void>;
}
