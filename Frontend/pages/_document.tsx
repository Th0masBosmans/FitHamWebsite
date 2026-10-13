import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="nl">
      <Head>
        <meta name="description" content="Fit Ham — volleybalclub uit Ham. Teams voor alle leeftijden en niveaus, een eigen webshop en een hechte clubcultuur." />
        <link rel="icon" href="/fithamlogofavicon.png" type="image/png" sizes="192x192" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
