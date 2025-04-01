export class ModelData {
    photo: string;
    description: string;
    price: number;
  
    constructor(photo: string, description: string, price: number) {
      this.photo = photo;
      this.description = description;
      this.price = price;
    }
  
    getFormattedPrice(): string {
      return `${this.price?.toFixed(2) || "0.00"}€`;
    }
  }
  