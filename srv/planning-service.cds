using my.bookshop as my from '../db/data-model';

@path:'planning'
service mainService {
    entity HNodes as projection on my.HierarchyNodes actions {
        function expandNode( level: Integer ) returns array of WPs; 
    };
    entity Projects as projection on my.Projects actions {
        function expandProject( level: Integer ) returns array of WPs;
    };
    entity WPs as projection on my.WorkPackages;

    // function expand( objectId: String, level: Integer ) returns array of WPs;                           
}