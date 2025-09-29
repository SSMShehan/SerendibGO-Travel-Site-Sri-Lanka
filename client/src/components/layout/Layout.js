import React from 'react';

const Layout = ({ children }) => {
  return (
    <main className="flex-1 pt-16">
      {children}
    </main>
  );
};

export default Layout;
