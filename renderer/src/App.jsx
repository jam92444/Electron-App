import "antd/dist/reset.css";
import { ConfigProvider, theme as antdTheme } from "antd";
import Router from "./Router";
import { useStateContext } from "./context/StateContext";
import { useEffect } from "react";
import { restoreSession } from "./Module/Auth/Services/auth.services";
import { SET_TOKEN, USER_DATA } from "./context/reducer/actionTypes";

const AppContent = () => {
  const { dispatch } = useStateContext();

  useEffect(() => {
    const initSession = async () => {
      const response = await restoreSession();

      if (response.success) {
        dispatch({ type: USER_DATA, payload: response.user });
        dispatch({ type: SET_TOKEN, payload: "logged-in" });
      }
    };

    initSession();
  }, []);

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
