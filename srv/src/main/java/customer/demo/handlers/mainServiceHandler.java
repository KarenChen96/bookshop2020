package customer.demo.handlers;

// import org.apache.olingo.commons.core.edm.EdmProviderImpl;
import com.sap.cds.feature.FeatureLoader;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.After;
import com.sap.cds.services.handler.annotations.On;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Stream;

import javax.print.attribute.standard.MediaSize.Other;

import com.sap.cds.Result;
import com.sap.cds.Row;
import com.sap.cds.services.EventName;
import com.sap.cds.services.cds.CdsService;

import cds.gen.mainservice.MainService_;
import cds.gen.mainservice.ExpandContext;
import cds.gen.mainservice.ExpandNodeContext;
import cds.gen.mainservice.ExpandProjectContext;
import cds.gen.mainservice.HNodes;
import cds.gen.mainservice.HNodes_;
import cds.gen.mainservice.Projects;
import cds.gen.mainservice.Projects_;
import cds.gen.mainservice.WPs;
import cds.gen.mainservice.WPs_;
import cds.gen.my.bookshop.HierarchyNodes_;

import static cds.gen.mainservice.MainService_.PROJECTS;
import static cds.gen.mainservice.MainService_.HNODES;
import static cds.gen.mainservice.MainService_.WPS;
import com.sap.cds.ql.Select;
import com.sap.cds.ql.cqn.CqnAnalyzer;
import com.sap.cds.reflect.CdsModel;

@Component
@ServiceName(MainService_.CDS_NAME)
public class mainServiceHandler implements EventHandler {

    @Autowired
    private PersistenceService db;

    private CqnAnalyzer analyzer;

    @Autowired
    public mainServiceHandler(CdsModel model) {
        // model is a tenant-dependant model proxy
        this.analyzer = CqnAnalyzer.create(model);
    }

    // Only show the first-level/project-level nodes when querying the projects
    // @After(event = CdsService.EVENT_READ, entity = { Projects_.CDS_NAME })
    // public List<Row> displayProjects() {

    //     // Result result; // result.list();
    //     List<Row> resList = new ArrayList<>();

    //     // HNodes root = nodes.filter( n -> ((String) n.get("type")).equals("root")
    //     // ).findFirst().get() ;
    //     Result root = db.run(Select.from(HNODES).columns(h -> h.get("ID")).where(h -> h.type().eq("root")));
    //     if (root == null) {
    //         // throw exception: no root
    //         return db.run(Select.from(PROJECTS)).list();
    //     } else {
    //         HNodes realRoot = root.first(HNodes.class).orElse(null);
    //         if (realRoot != null) {
    //             String rootId = realRoot.getId();
    //             // String rootId = (String) root.get("ID");
    //             // String object_id = (String) root.getObjectId();

    //             // how to read Projects type directly from HNodes???
    //             Result projects = db.run(Select.from(HNODES).where(n -> n.parent_ID().eq(rootId)));

    //             for (Row r : projects) {
    //                 String object_id = (String) r.get("object_id");
    //                 Result temp = db.run(Select.from(PROJECTS)
    //                         .columns(p -> p.ID(), p -> p.PlannedEndDate(), p -> p.PlannedStartDate(), p -> p.name())
    //                         .byId(object_id));
    //                 Optional<Row> row = temp.first();
    //                 resList.add(row.get());
    //             }
    //         }
    //     }
    //     return resList;
    //     // return nodes.filter(n -> n.getParentId().equals(rootId) || n.getType().equals("root"));
    //     // nodes.forEach(n -> {
    //     //     String object_id = n.getObjectId();
    //     //     Result result = db.run(Select.from(PROJECTS).byId(object_id));
    //     //     switch (n.getType()) {
    //     //         case "branch":
    //     //             Projects project = (Projects) result.first(Projects.class).get();
    //     //         case "leaf":
    //     //             WPs wp = (WPs) result.first(WPs.class).get();
    //     //     }
    //     // });
    // }

    @On(entity = Projects_.CDS_NAME)
    public void expandProjectOneLevel(ExpandProjectContext context) {
        List<WPs> res = new ArrayList<>();
        // String object_id = context.getObjectId();
        String object_id = (String) analyzer.analyze(context.getCqn()).targetKeys().get(Projects.ID);

        List<HNodes> nodes = db.run(Select.from(HNODES).where(n -> n.object_id().eq(object_id))).listOf(HNodes.class);
        HNodes node = nodes.stream().findFirst().orElse(null);
        if (node == null) {
            // throw Exception;
        } else {
            // Only expand one level here, later can be modified:expand n level depends on
            // the input parameter
            String node_id = node.getId();
            List<HNodes> children = db.run(Select.from(HNODES).where(n -> n.parent_ID().eq(node_id)))
                    .listOf(HNodes.class);
            for (HNodes child : children) {
                List<WPs> temp = db.run(Select.from(WPS)
                        .columns(w -> w.ID(), w -> w.name(), w -> w.PlannedStartDate(), w -> w.PlannedEndDate())
                        .where(w -> w.ID().eq(child.getObjectId()))).listOf(WPs.class);
                WPs wp = temp.stream().findFirst().orElse(null);
                if (wp != null) {
                    res.add(wp);
                }
            }
        }
        context.setResult(res);
    }

    // TBD: Expand the project into n levels. The input level should be within
    // [1,2].
    // Need to consider: 1. how to display the result, nested or flat?
    // 2. how to do the recursion (when level > 1, we need recursion)? Use which
    // data structure?
    // Above case seems not so matched with real business requirement...

    // @On(entity = {Projects_.CDS_NAME, WPs_.CDS_NAME})
    @On(event = "expand")
    public void expand(ExpandContext context) {
        List<WPs> res = new ArrayList<>();
        // object_ID needs to be modified from String to UUID later,
        String objectID = context.getObjectId(); // Retrieve from input parameter

        // Step 1: search the corresponding HNodes with the objectID
        List<HNodes> nodes = db.run(Select.from(HNODES).where(n -> n.object_id().eq(objectID))).listOf(HNodes.class);
        HNodes node = nodes.stream().findFirst().orElse(null);
        if (node == null) {
            // throw Exception;
        } else {
            // Step 2: expand one level descendent
            String node_id = node.getId();
            List<HNodes> children = db.run(Select.from(HNODES).where(n -> n.parent_ID().eq(node_id)))
                    .listOf(HNodes.class);
            for (HNodes child : children) {
                List<WPs> temp = db.run(Select.from(WPS)
                        // .columns(w -> w.ID(), w -> w.name(), w -> w.PlannedStartDate(), w ->
                        // w.PlannedEndDate())
                        .where(w -> w.ID().eq(child.getObjectId()))).listOf(WPs.class);
                WPs wp = temp.stream().findFirst().orElse(null);
                if (wp != null) {
                    res.add(wp);
                }
            }
        }
        context.setResult(res);
    }

    // Expand one sublevel nodes, no expansion for leaf nodes
    // Question: what is a proper return type? The sub-level can be both WPs and
    // Projects.
    // Or expanding a root node is not allowed (or realized by default)?
    // --> If so, return type can be determined as List<WPs>.
    @On(entity = HNodes_.CDS_NAME)
    public void expandOneLevel(ExpandNodeContext context) {
        // List<Row> resList = new ArrayList<>();

        // 1. Get HNodes ID
        String nodeID = (String) analyzer.analyze(context.getCqn()).targetKeys().get(HNodes.ID);

        List<HNodes> nodes = db.run(Select.from(HNODES).where(n -> n.ID().eq(nodeID))).listOf(HNodes.class);
        HNodes node = nodes.stream().findFirst().orElse(null);

        // 3. find all children of this node
        List<HNodes> children = db.run(Select.from(HNODES).where(n -> n.parent_ID().eq(nodeID))).listOf(HNodes.class);
        switch (node.getType()) {
            case "leaf":
                // leaf node can't be expanded anymore
                context.setResult(null);
            case "branch":
                // branch node has children which are WPs
                // Note: A work package can also be a branch node, this case is covered here.
                List<WPs> wps = new ArrayList<>();
                for (HNodes child : children) {
                    String objectID = child.getObjectId();
                    // Here, the type of children are limited to WPs.
                    List<WPs> result = db.run(Select.from(WPS).where(p -> p.ID().eq(objectID))).listOf(WPs.class);
                    WPs wp = result.stream().findFirst().orElse(null);
                    if (wp != null) {
                        wps.add(wp);
                    }
                }
                context.setResult(wps);
                return;
            case "root":
                // root node has children which are Projects
                // List<Projects> projects = db.run(Select.from(PROJECTS)
                // .where(p->p.ID().eq(objectID))).listOf(Projects.class);
                context.setResult(null);
        }
        context.setResult(null);
    }

    // TBD: 1. recursion (case: level > 1)
    // 2. Only display data (with function), consider how to use actions to
    // update/impact db data.
    // 3. Add actions to WP (a work package can also be expanded.) -- Low priority

}