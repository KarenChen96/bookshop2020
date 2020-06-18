package customer.demo.handlers;

import java.util.stream.Stream;
// import java.util.List;
import java.math.BigDecimal;

import org.springframework.stereotype.Component;
import org.springframework.beans.factory.annotation.Autowired;

import com.sap.cds.Result;
import com.sap.cds.ql.Select;
// import com.sap.cds.services.EventContext;
import com.sap.cds.services.cds.CdsService;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.After;
import com.sap.cds.services.handler.annotations.ServiceName;
import com.sap.cds.services.persistence.PersistenceService;

import com.sap.cds.ql.Update;
// import com.sap.cds.ql.cqn.CqnAnalyzer;
// import com.sap.cds.reflect.CdsModel;
// import com.sap.cds.services.ErrorStatuses;
// import com.sap.cds.services.ServiceException;
// import com.sap.cds.services.draft.DraftCancelEventContext;
// import com.sap.cds.services.draft.DraftPatchEventContext;
// import com.sap.cds.services.draft.DraftService;
// import com.sap.cds.services.handler.annotations.Before;
// import com.sap.cds.services.handler.annotations.On;
// import com.sap.cds.services.messages.Messages;

import cds.gen.catalogservice.CatalogService_;
import cds.gen.catalogservice.Books;
import cds.gen.catalogservice.Authors;
// import cds.gen.catalogservice.Books_;
// import cds.gen.catalogservice.Authors_;

import cds.gen.my.bookshop.Bookshop_;
// import static cds.gen.my.bookshop.Bookshop_.BOOKS;
import static cds.gen.my.bookshop.Bookshop_.AUTHORS;

@Component
@ServiceName(CatalogService_.CDS_NAME)
public class CatalogServiceHandler implements EventHandler {

	@Autowired
	private PersistenceService db;

	@After(event = CdsService.EVENT_READ)
	public void discountBooks(Stream<Books> books) {
		Double discount = 0.89;
		books.filter(b -> b.getTitle() != null && b.getStock() != null)
		.filter(b -> b.getStock() > 200)
		.forEach(b -> {
			b.setTitle(b.getTitle() + " (discounted)");
			BigDecimal bookPrice = b.getPrice();
			BigDecimal updatedPrice = bookPrice.multiply(BigDecimal.valueOf(discount));
			b.setPrice(updatedPrice);
		});
	}

	@After(event = CdsService.EVENT_READ)
	public void checkBooksAuthor(Stream<Books> books) {
		books.filter(b -> b.getTitle() != null && b.getStock() != null)
		.forEach( b -> {
			String author_id = b.getAuthorId();
			// get the author of the book
			Result result = db.run(Select.from(Bookshop_.AUTHORS).columns(a -> a.name()).byId(author_id));
			// Result result = db.run(Select.from(Bookshop_.AUTHORS).columns(a -> a.name()).where(a -> a.ID().eq(author_id)));
			Authors author = (Authors) result.first(Authors.class).get(); //.orElseThrow(notFound(MessageKeys.AUTHOR_MISSING));
			
			// For fun: update the author with the new name
			author.setName(author.getName() + "_new");	
			db.run(Update.entity(AUTHORS).data(author).byId(author_id)); // NOT clear yet, check Query Builder API
		});	
	}

	// @After(event = CdsService.EVENT_READ)
	// public void checkAuthorsBooks(Stream<Authors> authors) {}

}