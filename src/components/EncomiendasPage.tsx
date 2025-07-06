import React from 'react';
import { useTranslation } from 'react-i18next';

const EncomiendasPage: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div>
      <h1>{t('encomiendas_page_title')}</h1>
      <p>{t('encomiendas_page_content')}</p>
    </div>
  );
};

export default EncomiendasPage;
