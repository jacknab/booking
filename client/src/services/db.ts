export const dbSingle = async (table: string, columns: string[] | string, where: any) => {
  console.log(`Getting single ${table} with where`, where);
  // In a real application, you would fetch a single row from the database
  return { id: 1, name: 'Placeholder' };
};

export const dbUpdate = async (table: string, values: any, where: any) => {
  console.log(`Updating ${table} with values`, values, `and where`, where);
  // In a real application, you would update a row in the database
  return { id: 1, ...values };
};

export const dbSelect = async (table: string, columns: string[] | string, where: any, order: any) => {
  console.log(`Selecting from ${table} with where`, where, `and order`, order);
  // In a real application, you would fetch multiple rows from the database
  return [{ id: 1, name: 'Placeholder 1' }, { id: 2, name: 'Placeholder 2' }];
};