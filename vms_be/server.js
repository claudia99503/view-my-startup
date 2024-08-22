import dotenv from "dotenv";
dotenv.config(); // 환경 변수 설정

import express from "express";
import cors from "cors";
//import companyRoutes from "./src/routes/companyRoutes.js";

const app = express();
app.use(express.json());

// cors 설정( 일단, 모든 도메인에서의 요청을 허용해놓음 )
app.use(cors());

// 정적 파일 제공 설정
app.use("/images", express.static(process.env.STATIC_FILES_PATH));

// 라우터 등록( API 추가시, 라우터 추가 예정 )
//app.use("/api/companies", companyRoutes);

// 서버 시작
app.listen(process.env.PORT || 8000, () => console.log("Server Started"));