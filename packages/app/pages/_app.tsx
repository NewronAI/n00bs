import '../styles/globals.css'
import 'react-tooltip/dist/react-tooltip.css'
import type {AppProps} from 'next/app'
import {SWRConfig} from "swr";
import {UserProvider} from "@auth0/nextjs-auth0/client";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

// @ts-ignore for now because of cockroachdb
BigInt.prototype.toJSON = function() {
    return this.toString();
}

export default function App({ Component, pageProps }: AppProps) {
  return <SWRConfig value={{
      refreshInterval: 30000,
      fetcher: (resource, init) => fetch(resource, init).then(res => res.json())
  }}>
      <UserProvider>
        <Component {...pageProps} />
          <ToastContainer />
      </UserProvider>
  </SWRConfig>
}
