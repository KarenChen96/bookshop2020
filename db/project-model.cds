namespace project.planning;
using {cuid, managed} from '@sap/cds/common';

type NodeType : String enum { root; branch; leaf}

@fiori.draft.enabled
entity HierarchyNodes : cuid {
parent : Association to HierarchyNodes; 
children: Composition of many HierarchyNodes on children.parent = $self;
hierarchylevel: Integer;
type : NodeType;
sortnumber : Integer; 
ordinalnumber : Integer; 
object_ID : UUID; 
drillstate: String(10);
workpackage : Association to one WorkPackages on workpackage.ID = object_ID; 
subtreesize: Integer;

}

@fiori.draft.enabled
entity WorkPackages : cuid {
    name : String(18);
    processingstatus: String(2);
    costcenter: String(4);
    profitcenter: String(4);
    plant: String(4);
    functionarea: String(4);
    IsActiveEntity: Boolean;
    planningstartdate: Date; 
    planningenddate: Date; 
    actualstartdate: Date; 
    actualenddate: Date;
    factorycalendar: String(4);
}