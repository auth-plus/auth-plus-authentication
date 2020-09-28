import axios, { AxiosResponse } from "axios";
import { ITournament } from "../interfaces/index";

export class Tournament {
  public static async create(
    data: ITournament
  ): Promise<AxiosResponse<ITournament>> {
    return axios.post<ITournament>("/tournament/create", { ...data });
  }

  public static async readMany(
    id_list: number[]
  ): Promise<AxiosResponse<ITournament>> {
    return axios.get<ITournament>(`/tournament/read/${id_list.join(",")}`);
  }
}
