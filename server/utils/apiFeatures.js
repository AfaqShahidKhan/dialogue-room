class ApiFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excludedFields = ["page", "sort", "limit", "fields"];
    excludedFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    const parsedQuery = JSON.parse(queryStr);

    // Convert age filtering into birthdate filtering
    if (parsedQuery.age) {
        const currentDate = new Date();
        if (parsedQuery.age.$gte) {
            const minBirthdate = new Date(
                currentDate.getFullYear() - parsedQuery.age.$gte,
                currentDate.getMonth(),
                currentDate.getDate()
            );
            parsedQuery.birthdate = { ...parsedQuery.birthdate, $lte: minBirthdate };
        }
        if (parsedQuery.age.$lte) {
            const maxBirthdate = new Date(
                currentDate.getFullYear() - parsedQuery.age.$lte,
                currentDate.getMonth(),
                currentDate.getDate()
            );
            parsedQuery.birthdate = { ...parsedQuery.birthdate, $gte: maxBirthdate };
        }
        delete parsedQuery.age; // Remove age from query since it's virtual
    }

    this.query = this.query.find(parsedQuery);
    return this;
}


  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = this.queryString.page * 1 || 1;
    const limit = this.queryString.limit * 1 || 100;
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}

module.exports = ApiFeatures;