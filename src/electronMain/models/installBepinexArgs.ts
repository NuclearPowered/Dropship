/* eslint-disable */
import InstallBepinexResponse from "@/services/responses/updateResponse";

export default interface InstallBepinexArgs extends InstallBepinexResponse {
  location: string;
  downloadUrl: string;
}
