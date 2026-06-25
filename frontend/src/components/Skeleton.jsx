import React from 'react';

/* ── Skeleton Building Blocks ── */

export const SkeletonText = ({ width = '100%', height = '14px', style = {} }) => (
  <div className="skeleton" style={{ width, height, borderRadius: '6px', ...style }} />
);

export const SkeletonTitle = ({ width = '60%' }) => (
  <div className="skeleton" style={{ width, height: '22px', borderRadius: '6px', marginBottom: '12px' }} />
);

export const SkeletonImage = ({ height = '160px', borderRadius = '16px 16px 0 0' }) => (
  <div className="skeleton" style={{ width: '100%', height, borderRadius }} />
);

export const SkeletonCircle = ({ size = '40px' }) => (
  <div className="skeleton" style={{ width: size, height: size, borderRadius: '50%', flexShrink: 0 }} />
);

/* ── Skeleton Card (for restaurant / menu grids) ── */
export const SkeletonCard = () => (
  <div className="skeleton-card">
    <SkeletonImage />
    <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      <SkeletonTitle width="75%" />
      <SkeletonText width="100%" />
      <SkeletonText width="50%" />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
        <SkeletonText width="60px" height="18px" />
        <SkeletonText width="70px" height="32px" style={{ borderRadius: '8px' }} />
      </div>
    </div>
  </div>
);

/* ── Skeleton Grid (shows N skeleton cards) ── */
export const SkeletonGrid = ({ count = 4 }) => (
  <div className="grid-cols-4">
    {Array.from({ length: count }, (_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
);

/* ── Skeleton Table Row ── */
export const SkeletonTableRow = ({ cols = 5 }) => (
  <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
    {Array.from({ length: cols }, (_, i) => (
      <td key={i} style={{ padding: '0.75rem 1rem' }}>
        <SkeletonText width={i === 0 ? '40px' : `${60 + Math.random() * 30}%`} height="16px" />
      </td>
    ))}
  </tr>
);

/* ── Skeleton Order Card ── */
export const SkeletonOrderCard = () => (
  <div className="premium-card-static" style={{ padding: '1.75rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <SkeletonText width="120px" height="20px" />
        <SkeletonText width="180px" height="12px" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
        <SkeletonText width="80px" height="22px" />
        <SkeletonText width="100px" height="16px" />
      </div>
    </div>
    <div style={{ display: 'flex', gap: '1.5rem' }}>
      <SkeletonText width="100%" height="60px" style={{ borderRadius: '12px' }} />
    </div>
  </div>
);

export default {
  SkeletonText,
  SkeletonTitle,
  SkeletonImage,
  SkeletonCircle,
  SkeletonCard,
  SkeletonGrid,
  SkeletonTableRow,
  SkeletonOrderCard
};
