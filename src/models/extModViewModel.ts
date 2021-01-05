/* eslint-disable */
import ModMetadata from "@/electronMain/models/modMetadata";

export default interface ExtModMetadata extends ModMetadata {
  imageUrl: string;
  creator: string;
  description: string;
}
