export type Resolve<Response> = (
  value: Response | PromiseLike<Response>,
) => void
