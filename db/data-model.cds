namespace my.bookshop;
using { Currency, managed, cuid } from '@sap/cds/common';

entity Books {
  key ID : Integer;
  title  : String;
  stock  : Integer;
  author: Association to Authors; 
  price    : Decimal(9,2);
}

entity Authors : cuid {
  name         : String(111);
  dateOfBirth  : Date;
  dateOfDeath  : Date;
  placeOfBirth : String;
  placeOfDeath : String;
  books        : Association to many Books on books.author = $self;
}


type NodeType : String enum { root; branch; leaf }

entity HierarchyNodes : cuid {
  parent: Association to HierarchyNodes;
  children: Association to many HierarchyNodes on children.parent = $self;
  type: NodeType;
  sortNumber: Integer;
  ordinalNumber: Integer;
  object_id: String;
  project: Association to Projects on project.ID = $self.object_id;
  wp: Association to WorkPackages on wp.ID = $self.object_id;
}

// entity Projects for Gantt Chart Integration
// entity Projects : {
//   TaskName : String(30);
//   key Task : Integer;
//   ProcessingStatus : String(10);
//   PlannedStartDate : String;
//   PlannedEndDate : String;
//   ActaulStartDate: String;
//   ActaulEndDate: String;
//   ResponsibleCostCenter : String;
//   ProfitCenter : String;
//   Plant : String;
//   FunctionalArea : String;
//   FactoryCalendar : String;
// }

entity Projects {
  key ID: String;
  name: String(30);
  PlannedStartDate : String;
  PlannedEndDate : String;
  ActualStartDate: String;
  ActualEndDate: String;
}

entity WorkPackages {
  key ID: String;
  name: String(30);
  PlannedStartDate : String;
  PlannedEndDate : String;
  ActualStartDate: String;
  ActualEndDate: String;
}