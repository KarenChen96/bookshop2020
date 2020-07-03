using project.planning as project from '../db/project-model';

@path:'project'
service projectService {
    // entity HNodes as projection on project.HierarchyNodes actions {
    //     function expandNode( level: Integer ) returns array of WPs; 
    // };
    entity HierarchyNodes as projection on project.HierarchyNodes;
    entity WorkPackages as projection on project.WorkPackages;                          
}