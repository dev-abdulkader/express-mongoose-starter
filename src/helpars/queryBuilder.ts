import { Model } from 'mongoose';

class QueryBuilder {
  private model: Model<any>;
  private query: Record<string, any>;
  private mongoQuery: any;
  private options: Record<string, any>;

  constructor(model: Model<any>, query: Record<string, any>) {
    this.model = model;
    this.query = query;
    this.mongoQuery = {};
    this.options = {};
  }

  // **Search**
  search(searchableFields: string[]) {
    const searchTerm = this.query.searchTerm as string;
    if (searchTerm) {
      this.mongoQuery.$or = searchableFields.map((field) => ({
        [field]: { $regex: searchTerm, $options: 'i' },
      }));
    }
    return this;
  }

  // **Filter**
  filter() {
    const queryObj = { ...this.query };
    const excludeFields = ['searchTerm', 'sort', 'limit', 'page', 'fields', 'populate'];
    excludeFields.forEach((field) => delete queryObj[field]);

    const formattedFilters: Record<string, any> = {};
    for (const [key, value] of Object.entries(queryObj)) {
      if (typeof value === 'string' && value.includes('[')) {
        const [field, operator] = key.split('[');
        const op = operator.replace(']', '');
        formattedFilters[field] = { [`$${op}`]: parseFloat(value) };
      } else {
        formattedFilters[key] = value;
      }
    }

    this.mongoQuery = {
      ...this.mongoQuery,
      ...formattedFilters,
    };

    return this;
  }

  // **Sorting**
  sort() {
    const sortBy = (this.query.sort as string)?.split(',') || ['-createdAt'];
    const sortOptions: Record<string, number> = {};

    sortBy.forEach((field) => {
      if (field.startsWith('-')) {
        sortOptions[field.slice(1)] = -1;
      } else {
        sortOptions[field] = 1;
      }
    });

    this.options.sort = sortOptions;
    return this;
  }

  // **Pagination**
  paginate() {
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const skip = (page - 1) * limit;

    this.options.skip = skip;
    this.options.limit = limit;
    return this;
  }

  // **Fields Selection**
  fields() {
    const fields = this.query.fields as string;
    if (fields) {
      this.options.select = fields.split(',').join(' ');
    }
    return this;
  }

  // **Populate (include)**
  populate(populateFields: string[] | Record<string, any>[]) {
    this.options.populate = populateFields;
    return this;
  }

  // **Execute Query**
  async execute() {
    let query = this.model.find(this.mongoQuery);

    if (this.options.select) query = query.select(this.options.select);
    if (this.options.sort) query = query.sort(this.options.sort);
    if (this.options.skip) query = query.skip(this.options.skip);
    if (this.options.limit) query = query.limit(this.options.limit);
    if (this.options.populate) query = query.populate(this.options.populate);

    return await query.exec();
  }

  // **Count Total**
  async countTotal() {
    const total = await this.model.countDocuments(this.mongoQuery);
    const page = Number(this.query.page) || 1;
    const limit = Number(this.query.limit) || 10;
    const totalPage = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;
