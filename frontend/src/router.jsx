import { createContext, useCallback, useContext, useEffect, useState } from "react";

const RouterContext = createContext({ path: "/", navigate: () => {} });

/** Provide pathname state and history-based navigation, tracking back/forward events. */
export function RouterProvider({ children }) {
  const [path, setPath] = useState(() => window.location.pathname || "/");

  useEffect(() => {
    /** Synchronize the route with the browser pathname after history navigation. */
    function onPopState() {
      setPath(window.location.pathname || "/");
    }

    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = useCallback((to) => {
    if (window.location.pathname !== to) {
      window.history.pushState({}, "", to);
    }
    setPath(to);
    window.scrollTo({ top: 0 });
  }, []);

  return (
    <RouterContext.Provider value={{ path, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

/** Return the current pathname and navigation callback from router context. */
export function useRouter() {
  return useContext(RouterContext);
}

/** Render an anchor that uses the router for uncancelled, unmodified clicks. */
export function Link({ to, children, className, onClick, ...rest }) {
  const { navigate } = useRouter();

  /** Run the caller's click handler, then navigate unless cancelled or modified. */
  function handleClick(event) {
    if (onClick) onClick(event);
    if (event.defaultPrevented) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    event.preventDefault();
    navigate(to);
  }

  return (
    <a href={to} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  );
}
