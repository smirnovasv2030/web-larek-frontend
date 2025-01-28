import { IApi } from "../ShopApi";

export type ApiListResponse<Type> = {
    total: number,
    items: Type[]
};

export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export class Api implements IApi{
    readonly baseUrl: string;
    protected options: RequestInit;

    constructor(baseUrl: string, options: RequestInit = {}) {
        this.baseUrl = baseUrl;
        this.options = {
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers as object ?? {})
            }
        };
    }

    protected handleResponse(response: Response): Promise<object> {
        if (response.ok) return response.json();
        else return response.json()
            .then(data => Promise.reject(data.error ?? response.statusText));
    }

    async get<T>(uri: string): Promise<T> {
      const response = await fetch(this.baseUrl + uri, {
          ...this.options,
          method: 'GET'
      });
      return this.handleResponse(response) as Promise<T>;
    }
    async post<T>(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<T> {
      const response = await fetch(this.baseUrl + uri, {
          ...this.options,
          method,
          body: JSON.stringify(data)
      });
      return this.handleResponse(response) as Promise<T>;
  }
}
