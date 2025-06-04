import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Finances from '../Finances';
import ArtistRoyalties from './ArtistRoyalties';
import AdvancedReporting from './AdvancedReporting';

const FinancesRouter: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Finances />} />
      <Route path="/royalties" element={<ArtistRoyalties />} />
      <Route path="/reporting" element={<AdvancedReporting />} />
    </Routes>
  );
};

export default FinancesRouter;