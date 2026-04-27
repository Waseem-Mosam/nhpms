// lib/constants/districts.ts
// Botswana administrative districts used in the NHPMS application.
// Source: Statistics Botswana district boundaries.

/** All Botswana districts as a typed tuple for exhaustive use */
export const DISTRICTS = [
  'Central',
  'Chobe',
  'Francistown',
  'Gaborone',
  'Ghanzi',
  'Jwaneng',
  'Kgalagadi',
  'Kgatleng',
  'Kweneng',
  'Lobatse',
  'North-East',
  'North-West',
  'Selebi-Phikwe',
  'South-East',
  'Southern',
] as const

export type District = (typeof DISTRICTS)[number]
