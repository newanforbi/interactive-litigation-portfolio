import { useState, useMemo } from "react";
import { PORTFOLIO } from "../data";

export const useCaseFilters = () => {
  const [clusterFilter, setClusterFilter] = useState(null);
  const [typeFilter, setTypeFilter] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCases = useMemo(() => {
    return PORTFOLIO.cases.filter(c => {
      if (clusterFilter && c.cluster !== clusterFilter) return false;
      if (typeFilter && c.type !== typeFilter) return false;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        return c.caption.toLowerCase().includes(q) || c.claims.toLowerCase().includes(q) || c.defendants.toLowerCase().includes(q) || c.key_facts.toLowerCase().includes(q);
      }
      return true;
    });
  }, [clusterFilter, typeFilter, searchQuery]);

  return { clusterFilter, setClusterFilter, typeFilter, setTypeFilter, searchQuery, setSearchQuery, filteredCases };
};
