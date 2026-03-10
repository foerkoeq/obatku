import { UserRoleType } from "./user";

/** A single sub-feature within a feature group */
export type SubFeature = {
  id: string;
  name: string;
};

/** A top-level feature, optionally containing sub-features */
export type Feature = {
  id: string;
  name: string;
  icon: string;
  description: string;
  subFeatures: SubFeature[];
};

/** Toggle state for one role's features: featureId -> enabled, subFeatureId -> enabled */
export type FeatureToggleMap = Record<string, boolean>;

/** Full state for all roles */
export type RoleFeatureConfig = Record<UserRoleType, FeatureToggleMap>;
