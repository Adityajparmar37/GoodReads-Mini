import { client, DATABASE } from "../config/index.js";
const featureActivationStauts = "feature_activation_stauts";

export const findFeatureActivationStatus = (featureName) =>
  client.db(DATABASE).collection(featureActivationStauts).findOne(featureName);
