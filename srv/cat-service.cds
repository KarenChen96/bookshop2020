using my.bookshop as my from '../db/data-model';

@path:'browse'
service CatalogService {
    @readonly entity Books as projection on my.Books;
    entity Authors as projection on my.Authors;
}