import '../styles/globals.css'
import 'react-tooltip/dist/react-tooltip.css'
import type {AppProps} from 'next/app'
import {SWRConfig} from "swr";
import {UserProvider} from "@auth0/nextjs-auth0/client";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import React, { useEffect } from 'react'
import ErrorBoundary from "src/components/ErrorBoundary";
import {Router} from "next/router"
import NProgress from "nprogress";
import Script from "next/script";

// @ts-ignore for now because of cockroachdb
BigInt.prototype.toJSON = function() {
    return this.toString();
}

Router.events.on('routeChangeStart', NProgress.start);
Router.events.on('routeChangeComplete', NProgress.done);
Router.events.on('routeChangeError', NProgress.done);

const HJID = process.env.NEXT_PUBLIC_HOTJAR_ID;
const HJSV = process.env.NEXT_PUBLIC_HOTJAR_SNIPPET_VERSION;

export default function App({ Component, pageProps }: AppProps) {


  return <SWRConfig value={{
      refreshInterval: 30000,
      fetcher: (resource, init) => fetch(resource, init).then(res => res.json())
  }}>
      <ErrorBoundary>
          <UserProvider>
            <Component {...pageProps} />
              <ToastContainer />
          </UserProvider>
      </ErrorBoundary>
      {/*{*/}
      {/*    (process.env.NODE_ENV !== "production" && HJID && HJSV) &&*/}
      {/*    <Script id={"hotjar-script"} strategy={"afterInteractive"}>*/}
      {/*        {`(function(h,o,t,j,a,r){*/}
      {/*      h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};*/}
      {/*      h._hjSettings={hjid:${HJID},hjsv:${HJSV}*/}
      {/*      a=o.getElementsByTagName('head')[0];*/}
      {/*      r=o.createElement('script');r.async=1;*/}
      {/*      r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;*/}
      {/*      a.appendChild(r);*/}
      {/*  })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');*/}
      {/*                `}*/}
      {/*    </Script>*/}
      {/*}*/}
  </SWRConfig>
}
