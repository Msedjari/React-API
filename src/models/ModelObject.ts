import { ModelData } from "./ModelData";

export class ModelObject {
  id?: string;
  name: string;
  data: ModelData;

  constructor(name: string, data: ModelData, id?: string) {
    this.id = id;
    this.name = name;
    this.data = new ModelData(data.photo, data.description, data.price);
  }
}
