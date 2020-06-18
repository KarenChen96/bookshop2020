using my.bookshop as my from '../db/data-model';

@path:'planning'
service mainService {
    // entity HNodes as projection on my.HierarchyNodes;
    entity Projects as projection on my.Projects;
}