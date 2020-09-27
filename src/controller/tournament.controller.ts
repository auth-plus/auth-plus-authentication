import axios, { AxiosResponse } from "axios";
import { ITournament } from "../interfaces/index";

export class Tournament {
  public static async create(
    data: ITournament
  ): Promise<AxiosResponse<ITournament>> {
    return axios.post<ITournament>("/tournament/create", { ...data });
  }
}
