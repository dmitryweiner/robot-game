import { useEffect, useState } from 'react';

export type Route = { screen: 'hub' } | { screen: 'game'; gameId: string };

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '');
  const match = path.match(/^\/game\/([\w-]+)$/);
  if (match) {
    return { screen: 'game', gameId: match[1] };
  }
  return { screen: 'hub' };
}

export function routeToHash(route: Route): string {
  return route.screen === 'hub' ? '#/' : `#/game/${route.gameId}`;
}

export function useHashRoute(): [Route, (route: Route) => void] {
  const [route, setRouteState] = useState<Route>(() => parseHash(window.location.hash));

  useEffect(() => {
    const onHashChange = () => setRouteState(parseHash(window.location.hash));
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  const navigate = (next: Route) => {
    window.location.hash = routeToHash(next);
  };

  return [route, navigate];
}
