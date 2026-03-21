import {
  collection,
  query,
  where,
  orderBy,
  Firestore,
  Query,
} from 'firebase/firestore';

export function getRepsRef(db: Firestore) {
  return collection(db, 'representantes');
}

export function getActiveRepsQuery(db: Firestore): Query {
  return query(
    getRepsRef(db),
    where('active', '==', true),
    orderBy('name', 'asc')
  );
}
