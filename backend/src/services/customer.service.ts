import * as customerRepo from '../repositories/customer.repository';
import * as followupRepo from '../repositories/followup.repository';

export async function getAllCustomers(params: {
  search?: string;
  status?: string;
  customer_type?: string;
  page: number;
  limit: number;
}) {
  const { rows, total } = await customerRepo.findAll(params);
  return {
    customers: rows,
    pagination: {
      page: params.page,
      limit: params.limit,
      total,
      totalPages: Math.ceil(total / params.limit),
    },
  };
}

export async function getCustomerById(id: string) {
  const customer = await customerRepo.findById(id);
  if (!customer) {
    throw new Error('Customer not found');
  }
  return customer;
}

export async function createCustomer(data: Partial<customerRepo.CustomerRow>) {
  return customerRepo.create(data);
}

export async function updateCustomer(id: string, data: Partial<customerRepo.CustomerRow>) {
  const existing = await customerRepo.findById(id);
  if (!existing) {
    throw new Error('Customer not found');
  }
  return customerRepo.update(id, data);
}

export async function deleteCustomer(id: string) {
  const existing = await customerRepo.findById(id);
  if (!existing) {
    throw new Error('Customer not found');
  }
  return customerRepo.deleteById(id);
}

export async function getFollowUps(customerId: string) {
  const customer = await customerRepo.findById(customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }
  return followupRepo.findByCustomerId(customerId);
}

export async function addFollowUp(
  customerId: string,
  note: string,
  followUpDate: Date | null,
  createdBy: string
) {
  const customer = await customerRepo.findById(customerId);
  if (!customer) {
    throw new Error('Customer not found');
  }

  const followUp = await followupRepo.create({
    customer_id: customerId,
    note,
    follow_up_date: followUpDate,
    created_by: createdBy,
  });

  // Update customer's follow_up_date if a new one is provided
  if (followUpDate) {
    await customerRepo.update(customerId, { follow_up_date: followUpDate } as Partial<customerRepo.CustomerRow>);
  }

  return followUp;
}
