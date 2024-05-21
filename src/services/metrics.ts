import { Counter } from 'prom-client';

const fetchErrors = new Counter({
  name: 'fetch_errors_total',
  help: 'Total number of fetch errors',
});

export {
  fetchErrors,
};
