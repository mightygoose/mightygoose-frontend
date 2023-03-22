const baseUrl = global.window ? "" : process.env.API_HOST;

const fetcher = <T>(url: string, ...rest: any[]) =>
  fetch(`${baseUrl}${url}`, ...rest).then<T>((res) => res.json());

export default fetcher;
