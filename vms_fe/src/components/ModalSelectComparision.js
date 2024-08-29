import React, { useEffect, useState, useMemo, useCallback } from "react";
import style from "./ModalSelectComparision.module.css";
import Pagination from "components/common/Pagination";
import SearchBar from "components/common/SearchBar";
import SelectBtn from "./common/SelectBtn";
import deleteIcon from "assets/images/ic_delete.svg";
import { getApiData } from "../API/api"; // 서버 API 함수 추가

const ModalSelectComparision = ({
  isOpen,
  onClose,
  title,
  text,
  autoClose = false, // 바로 닫히기
  preSelectedCompanies = [], // 선택된 기업 목록
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCompanies, setSelectedCompanies] = useState([]);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [companyList, setCompanyList] = useState([]); // 서버에서 가져온 기업 리스트 상태
  const [isLoading, setIsLoading] = useState(false); // 로딩 상태
  const itemsPerPage = 5;

  useEffect(() => {
    setSelectedCompanies(preSelectedCompanies);
  }, [preSelectedCompanies, isOpen]);

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
    }
  }, [isOpen, searchTerm]);

  const fetchCompanies = async () => {
    setIsLoading(true);
    try {
      const data = await getApiData(1, 84, searchTerm, "name", "asc"); // 84개의 기업 데이터를 가져오기
      setCompanyList(data.companies || []); // 데이터가 없을 수 있는 경우 대비
    } catch (error) {
      console.error("기업 데이터를 가져오는 중 오류가 발생했습니다:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = useMemo(
    () => Math.ceil(companyList.length / itemsPerPage),
    [companyList.length, itemsPerPage]
  );

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  }, []);

  const handleSelect = useCallback(
    (companyName) => {
      const company = companyList.find((c) => c.name === companyName);

      if (selectedCompanies.length >= 5) {
        setError("*비교할 기업은 최대 5개까지 선택 가능합니다.");
        return;
      }

      if (
        !selectedCompanies.some((selected) => selected.name === companyName)
      ) {
        setSelectedCompanies((prev) => [...prev, company]);
        setError("");

        if (autoClose) {
          onClose([company]);
        }
      }
    },
    [companyList, selectedCompanies, onClose, autoClose]
  );

  const handleDeselect = useCallback((companyName) => {
    setSelectedCompanies((prev) =>
      prev.filter((company) => company.name !== companyName)
    );
    setError("");
  }, []);

  const handlePageChange = useCallback(
    (page) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const currentCompanies = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return companyList.slice(startIndex, startIndex + itemsPerPage);
  }, [companyList, currentPage, itemsPerPage]);

  const handleClose = () => {
    onClose(selectedCompanies);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={style.modalOverlay} onClick={handleOverlayClick}>
      <div className={style.modalContainer}>
        <div className={style.modalContent}>
          <div className={style.modalHeadText}>
            {title}
            <img
              src={deleteIcon}
              className={style.deleteLogo}
              alt="deleteLogo"
              onClick={handleClose}
            />
          </div>

          <SearchBar
            value={searchTerm}
            onChange={handleSearchChange}
            onClear={() => setSearchTerm("")}
          />

          {selectedCompanies.length > 0 && (
            <div className={style.PartitionHug}>
              <h2 className={style.CompaniesColumnText}>
                {text} ({selectedCompanies.length})
              </h2>
              <ul className={style.companyColumnsHug}>
                {selectedCompanies.map((company) => (
                  <li key={company.name} className={style.companyColumns}>
                    <div className={style.companyColumnsLogoTextHug}>
                      <img
                        src={company.logoUrl}
                        alt={`${company.name} logo`}
                        className={style.companyLogo}
                      />
                      <div className={style.companyColumnsNameCategoryHug}>
                        <div className={style.companyColumnsName}>
                          {company.name}
                        </div>
                        <div className={style.companyColumnsCategory}>
                          {company.category}
                        </div>
                      </div>
                    </div>

                    <SelectBtn
                      onClick={() => handleDeselect(company.name)}
                      text="선택 해제"
                      status="deselected"
                    />
                  </li>
                ))}
              </ul>
            </div>
          )}

          {searchTerm && (
            <div className={style.PartitionHug}>
              <h2 className={style.CompaniesColumnText}>
                검색 결과 ({companyList.length})
              </h2>
              {companyList.length === 0 ? (
                <div className={style.noResultsMessage}>
                  검색결과가 없습니다
                </div>
              ) : (
                <>
                  <ul className={style.companyColumnsHug}>
                    {currentCompanies.map((company) => (
                      <li key={company.name} className={style.companyColumns}>
                        <div className={style.companyColumnsLogoTextHug}>
                          <img
                            src={company.logoUrl}
                            alt={`${company.name} logo`}
                            className={style.companyLogo}
                          />
                          <div className={style.companyColumnsNameCategoryHug}>
                            <div className={style.companyColumnsName}>
                              {company.name}
                            </div>
                            <div className={style.companyColumnsCategory}>
                              {company.category}
                            </div>
                          </div>
                        </div>

                        {selectedCompanies.some(
                          (selected) => selected.name === company.name
                        ) ? (
                          <SelectBtn
                            onClick={() => handleDeselect(company.name)}
                            text="선택완료"
                            status="selected"
                          />
                        ) : (
                          <SelectBtn
                            onClick={() => handleSelect(company.name)}
                            text="선택하기"
                            status="default"
                          />
                        )}
                      </li>
                    ))}
                  </ul>
                  {error && <div className={style.errorMessage}>{error}</div>}
                </>
              )}
            </div>
          )}

          {searchTerm && companyList.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              hasNext={currentPage < totalPages}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalSelectComparision;

