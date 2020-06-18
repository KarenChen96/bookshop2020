package customer.demo.handlers;

import static org.junit.Assert.assertEquals;

import java.util.stream.Stream;
import java.math.BigDecimal;

import org.junit.Before;
import org.junit.Test;

import cds.gen.catalogservice.Books;
// import customer.demo.handlers.CatalogServiceHandler;

public class CatalogServiceHandlerTest {

	private CatalogServiceHandler handler = new CatalogServiceHandler();
	private Books book = Books.create();

	@Before
	public void prepareBook() {
		book.setTitle("title");
		book.setPrice(new BigDecimal(14.00));
	}

	@Test
	public void testDiscount() {
		book.setStock(500);
		handler.discountBooks(Stream.of(book));
		assertEquals("title (discounted)", book.getTitle());
	}

	@Test
	public void testNoDiscount() {
		book.setStock(100);
		handler.discountBooks(Stream.of(book));
		assertEquals("title", book.getTitle());
	}

	@Test
	public void testNoStockAvailable() {
		handler.discountBooks(Stream.of(book));
		assertEquals("title", book.getTitle());
	}

}