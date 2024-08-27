import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import asyncHandler from "../middlewares/asyncHandler.js";
import {
  BadRequestException,
  NotFoundException,
} from "../errors/CustomExceptions.js";

const router = Router();
const prisma = new PrismaClient();

// virtualInvestment 업데이트 함수
async function updateVirtualInvestment(companyId) {
  const sumVirtualInvestment = await prisma.investment.aggregate({
    where: { companyId: companyId },
    _sum: { investmentAmount: true },
  });

  await prisma.company.update({
    where: { id: companyId },
    data: {
      virtualInvestment: sumVirtualInvestment._sum.investmentAmount || 0,
    },
  });
}

//가상 투자 추가 API
router.post(
  "/",
  asyncHandler(async (req, res) => {
    const {
      companyId,
      investorName,
      investmentAmount,
      investmentComment,
      password,
    } = req.body;

    // 필수 필드 검증
    if (
      companyId === undefined ||
      !investorName ||
      investmentAmount === undefined ||
      !investmentComment ||
      !password
    ) {
      throw new BadRequestException("모든 필드는 필수값입니다");
    }

    // 투자 항목 생성
    const companyExists = await prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!companyExists) {
      throw new NotFoundException("해당 회사 정보가 존재하지 않습니다");
    }

    const investment = await prisma.investment.create({
      data: {
        companyId,
        investorName,
        investmentAmount,
        investmentComment,
        password,
      },
    });

    // virtualInvestment 업데이트 *추가
    await updateVirtualInvestment(companyId);
    res.status(201).json(investment);
  })
);

// 가상 투자 수정 API
router.put(
  "/:investmentId",
  asyncHandler(async (req, res) => {
    const investmentId = parseInt(req.params.investmentId, 10);
    const { investorName, investmentAmount, investmentComment, password } =
      req.body;

    // 필수 필드 검증
    if (
      !investorName ||
      investmentAmount === undefined ||
      !investmentComment ||
      !password
    ) {
      throw new BadRequestException("모든 필드는 필수값입니다");
    }

    // 투자 정보 가져오기
    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
    });

    if (!investment) {
      throw new NotFoundException("해당 투자 정보가 존재하지 않습니다");
    }

    // 비밀번호 검증
    if (investment.password !== password) {
      throw new BadRequestException("비밀번호가 일치하지 않습니다");
    }

    // 투자 정보 업데이트
    const updatedInvestment = await prisma.investment.update({
      where: { id: investmentId },
      data: {
        investorName,
        investmentAmount,
        investmentComment,
      },
    });

    // virtualInvestment 업데이트
    await updateVirtualInvestment(companyId);

    res.status(200).json(updatedInvestment);
  })
);

// 가상 투자 삭제 API
router.delete(
  "/:investmentId",
  asyncHandler(async (req, res) => {
    const investmentId = parseInt(req.params.investmentId, 10);
    const { password } = req.body;

    // 투자 정보 가져오기
    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
    });

    if (!investment) {
      throw new NotFoundException("해당 투자 정보가 존재하지 않습니다");
    }

    // 비밀번호 검증
    if (investment.password !== password) {
      throw new BadRequestException("비밀번호가 일치하지 않습니다");
    }

    // 투자 정보 삭제
    await prisma.investment.delete({
      where: { id: investmentId },
    });

    // virtualInvestment 업데이트
    await updateVirtualInvestment(companyId);

    res.status(204).send();
  })
);

// 투자자 상세 정보 조회 및 순위 계산 API
router.get(
  "/:investmentId",
  asyncHandler(async (req, res) => {
    const investmentId = parseInt(req.params.investmentId, 10);

    // 투자자 정보 가져오기
    const investment = await prisma.investment.findUnique({
      where: { id: investmentId },
    });

    if (!investment) {
      throw new NotFoundException("해당 투자 정보가 존재하지 않습니다");
    }

    // 전체 투자자 목록을 investmentAmount 기준으로 정렬
    const allInvestments = await prisma.investment.findMany({
      orderBy: {
        investmentAmount: "desc",
      },
    });

    // 순위 계산
    const rankedInvestments = allInvestments.map((inv, index) => ({
      ...inv,
      rank: index + 1,
    }));

    // 요청된 투자자의 상세 정보, 순위 추출
    const investmentWithRank = rankedInvestments.find(
      (inv) => inv.id === investmentId
    );

    res.status(200).json({
      investment: investmentWithRank, // 투자자 순위
      rank: investmentWithRank.rank, // 투자자 순위
      totalInvestments: rankedInvestments.length, // 페이지네이션 목적용 총 투자자수
    });
  })
);

export default router;
