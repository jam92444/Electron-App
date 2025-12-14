import "antd/dist/reset.css";
import { ConfigProvider, theme as antdTheme } from "antd";
import Router from "./Router";

const AppContent = () => {
  return (
    <ConfigProvider
      cssVar={false} // important fix
      theme={{
        algorithm: antdTheme.defaultAlgorithm,

        token: {
          colorPrimary: "#f97316",
          colorBgBase: "#ffffff",

          colorBgContainer: "#ffffff",
          colorTextBase: "#1f2937",
          colorBorder: "#e5e7eb",
        },
      }}
    >
      <Router />
    </ConfigProvider>
  );
};

const App = () => <AppContent />;

export default App;
