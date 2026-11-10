import { CrudRepository } from "@oitenta/shared";
import { __AGGREGATE_CLASS_NAME__ } from "../model";

export interface __AGGREGATE_CLASS_NAME__PageParams {
  page: number;
  perPage: number;
}

export interface __AGGREGATE_REPOSITORY_NAME__ extends CrudRepository<
  __AGGREGATE_CLASS_NAME__,
  __AGGREGATE_CLASS_NAME__,
  __AGGREGATE_CLASS_NAME__,
  __AGGREGATE_CLASS_NAME__PageParams
> {}
