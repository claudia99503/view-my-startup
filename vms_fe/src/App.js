import "./App.css";
import "./styles/reset.css";
import React from "react";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";

// 페이지
import DefaultPage from "pages/DefaultPage";
import CompanyInvestDetail from "pages/CompanyInvestDetail";
import CurrentStateInvest from "pages/CurrentStateInvest";
import MyCompanyCompare from "pages/MyCompanyCompare";
import CurrentStateCompare from "pages/CurrentStateCompare";

//기존 테스트 페이지
import Test from "./test";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<Navigate to="/" />} />
        <Route exact path="/" element={<DefaultPage />} />
        <Route path="/mycompany" element={<MyCompanyCompare />} />
        <Route path="/compare" element={<CurrentStateCompare />} />
        <Route path="/investinfo" element={<CurrentStateInvest />} />
        <Route path="/id/:companyId" element={<CompanyInvestDetail />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
