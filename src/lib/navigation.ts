/**
 * Where to come back to after a detour through the sign-in screen.
 *
 * The path alone was not enough: a visitor who opened /search?q=dune&page=2
 * and then signed in was dropped on the home page instead of their search.
 */
export function returnPath(location: {
  pathname: string;
  search: string;
  hash: string;
}): string {
  return `${location.pathname}${location.search}${location.hash}` || "/";
}
