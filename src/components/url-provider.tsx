"use client";

import React, { useEffect, useState } from "react";

interface UrlProviderProps {
  children: React.ReactNode;
}

export function UrlProvider({ children }: UrlProviderProps) {
  const [currentUrl, setCurrentUrl] = useState("");

  useEffect(() => {
    const baseUrl = window.location.origin;

    const isProxy =
      !baseUrl.includes("localhost") && !baseUrl.includes("127.0.0.1");

    setCurrentUrl(baseUrl);

    if (isProxy) {
      console.log("Using proxy URL for redirects:", baseUrl);
    }
  }, []);

  const childrenWithUrl = React.Children.map(children, (child) => {
    // Narrow to an actual intrinsic <form> element
    if (React.isValidElement(child) && child.type === "form") {
      const formEl =
        child as React.ReactElement<React.ComponentPropsWithoutRef<"form">>;

      const existingChildren = React.Children.toArray(formEl.props.children);

      return React.cloneElement(
        formEl,
        formEl.props, // keep existing props
        ...existingChildren,
        <input
          key="site-url-input"
          type="hidden"
          name="site_url"
          value={currentUrl}
        />
      );
    }

    return child;
  });

  return <>{childrenWithUrl}</>;
}
