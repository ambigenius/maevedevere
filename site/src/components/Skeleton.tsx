import React from 'react';

type SkeletonProps = {
  count?: number;
};

const Skeleton: React.FC<SkeletonProps> = ({ count = 1 }) => (
  <>
    {Array.from({ length: count }).map((_, idx) => (
      <div key={idx} className="skel" aria-hidden="true" />
    ))}
  </>
);

export default Skeleton;
