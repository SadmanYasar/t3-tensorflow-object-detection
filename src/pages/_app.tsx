import { type AppType } from "next/app";

import { api } from "~/utils/api";
import { ClerkProvider } from "@clerk/nextjs";
import "~/styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ClerkProvider {...pageProps}>
      <Component {...pageProps} />
    </ClerkProvider>
  );
}

export default api.withTRPC(MyApp);
