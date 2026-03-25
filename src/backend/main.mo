import Map "mo:core/Map";
import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";
import Order "mo:core/Order";

actor {
  // Explicit migration: drop the old ADMIN_PASSWORD stable variable
  stable var ADMIN_PASSWORD : Text = "";
  system func postupgrade() {
    ADMIN_PASSWORD := "";
  };

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  type ArticleId = Nat;

  type Article = {
    id : ArticleId;
    title : Text;
    bodyHtml : Text;
    excerpt : Text;
    coverImageId : ?Text;
    audioFileId : ?Text;
    slug : Text;
    createdAt : Int;
    published : Bool;
    category : Text;
  };

  public type UserProfile = {
    name : Text;
  };

  let articles = Map.empty<ArticleId, Article>();
  let userProfiles = Map.empty<Principal, UserProfile>();
  let customCategories = Map.empty<Text, ()>();

  module Article {
    public func compare(a : Article, b : Article) : Order.Order {
      Nat.compare(a.id, b.id);
    };
  };

  var nextId = 1;

  // User Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Article Management Functions (Admin-only)
  public shared ({ caller }) func createArticle(article : Article) : async ArticleId {
    initializeIfEmpty();

    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can create articles");
    };
    let newId = nextId;
    nextId += 1;
    let newArticle : Article = {
      article with
      id = newId;
      slug = article.slug.trimStart(#char '/');
      createdAt = Time.now();
    };
    articles.add(newId, newArticle);
    newId;
  };

  public shared ({ caller }) func updateArticle(id : ArticleId, article : Article) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can update articles");
    };
    if (not articles.containsKey(id)) {
      Runtime.trap("Article not found");
    };
    let updatedArticle : Article = {
      article with
      id;
      slug = article.slug.trimStart(#char '/');
    };
    articles.add(id, updatedArticle);
  };

  public shared ({ caller }) func deleteArticle(id : ArticleId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can delete articles");
    };
    if (not articles.containsKey(id)) {
      Runtime.trap("Article not found");
    };
    articles.remove(id);
  };

  public shared ({ caller }) func togglePublished(id : ArticleId) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can toggle published state");
    };
    switch (articles.get(id)) {
      case (null) { Runtime.trap("Article not found") };
      case (?article) {
        let updatedArticle : Article = {
          article with
          published = not article.published;
        };
        articles.add(id, updatedArticle);
      };
    };
  };

  // Category Management (Admin-only)
  public shared ({ caller }) func addCategory(name : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can manage categories");
    };
    let trimmed = name.trimStart(#char ' ').trimEnd(#char ' ');
    if (trimmed.size() == 0) {
      Runtime.trap("Category name cannot be empty");
    };
    customCategories.add(trimmed, ());
  };

  public shared ({ caller }) func removeCategory(name : Text) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can manage categories");
    };
    customCategories.remove(name);
  };

  // Public Query Functions
  public query func getPublishedArticles() : async [Article] {
    articles.values().toArray().filter(
      func(article) { article.published }
    ).sort();
  };

  public query func getArticleBySlug(slug : Text) : async ?Article {
    articles.values().find(
      func(a) { Text.equal(a.slug, slug) }
    );
  };

  public query func getArticleById(id : ArticleId) : async ?Article {
    articles.get(id);
  };

  public query func getArticlesByCategory(category : Text) : async [Article] {
    articles.values().toArray().filter(
      func(article) { article.published and Text.equal(article.category, category) }
    ).sort();
  };

  public query func getAllArticleSlugs() : async [Text] {
    articles.values().toArray().filter(
      func(article) { article.published }
    ).map(func(a) { a.slug });
  };

  public query func getAllCategories() : async [Text] {
    let seen = Map.empty<Text, ()>();
    for ((cat, _) in customCategories.entries()) {
      seen.add(cat, ());
    };
    for (article in articles.values()) {
      if (article.published and not seen.containsKey(article.category)) {
        seen.add(article.category, ());
      };
    };
    seen.keys().toArray();
  };

  public query func getHomepageArticles() : async [Article] {
    articles.values().toArray().filter(
      func(article) { article.published }
    ).sort();
  };

  // Admin-only: returns all articles including unpublished
  public query ({ caller }) func getAllArticles() : async [Article] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admin can view all articles");
    };
    articles.values().toArray().sort();
  };

  public query func searchArticles(searchText : Text) : async [Article] {
    let searchLower = searchText.toLower();
    articles.values().toArray().filter(
      func(article) {
        article.published and (
          article.title.toLower().contains(#text searchLower) or
          article.bodyHtml.toLower().contains(#text searchLower)
        )
      }
    ).sort();
  };

  func initializeIfEmpty() {
    if (articles.size() == 0) {
      let defaultCats = ["Lifestyle", "Global Trends", "Politics", "New", "Culture", "Opinion"];
      for (cat in defaultCats.values()) {
        customCategories.add(cat, ());
      };

      let sampleArticlesArray : [Article] = [
        {
          id = 1;
          createdAt = Time.now();
          title = "Welcome to The Dusky Lotus News";
          bodyHtml = "<p>The Dusky Lotus News is a new project dedicated to distributed, decentralized, deterministic, digital journalism.</p><p>Our mission is ADVENTURE! If you are interested in helping us, subscribe today, and reach out directly to our editor.</p>";
          excerpt = "The Dusky Lotus News is a new project dedicated to distributed, decentralized, deterministic, digital journalism. Our mission is ADVENTURE!";
          coverImageId = ?"default-logo.png";
          audioFileId = null;
          slug = "welcome-to-dusky-lotus-news";
          published = true;
          category = "Updates";
        },
        {
          id = 2;
          createdAt = Time.now();
          title = "Difinity Internet Computor Projectic";
          bodyHtml = "<p>Today, I will share a repeatedly common story. After 1.5 years of dedicated programming for the Internet Computer, a member of our core team made a devastating mistake.</p>";
          excerpt = "Today, I will share a story that repeats itself over and over. After 1.5 years of dedicated programming for the Internet Computer, a member of our core team made a devastating error.";
          coverImageId = ?"default-logo.png";
          audioFileId = ?"browsing.mp3";
          slug = "difinity-internet-computor-projectic";
          published = false;
          category = "Global Trends";
        },
        {
          id = 3;
          createdAt = Time.now();
          title = "Rat King Found in School Kitchen";
          bodyHtml = "<p>In a shocking turn of events, a rare rat king was discovered in the kitchen of a local high school.</p>";
          excerpt = "A rare rat king was found in a high school kitchen, causing a stir among staff and students.";
          coverImageId = ?"rat-king-photo.jpg";
          audioFileId = null;
          slug = "rat-king-school-kitchen";
          published = false;
          category = "New";
        },
        {
          id = 4;
          createdAt = Time.now();
          title = "Austin Positivity Project Launches New Initiative";
          bodyHtml = "<p>The Austin Positivity Project has launched a new initiative aimed at spreading kindness and joy throughout the city.</p>";
          excerpt = "The Austin Positivity Project is encouraging residents to perform acts of kindness and spread positivity throughout the city.";
          coverImageId = ?"austin-photo.jpg";
          audioFileId = null;
          slug = "austin-positivity-project-initiative";
          published = true;
          category = "Lifestyle";
        },
        {
          id = 5;
          createdAt = Time.now();
          title = "Exclusive Interview with DFINITY Researcher";
          bodyHtml = "<p>We sat down with a leading researcher from DFINITY to discuss the future of the Internet Computer.</p>";
          excerpt = "An exclusive interview with a DFINITY researcher offers insights into the future of the Internet Computer and technological advancements.";
          coverImageId = ?"dfinity-research.jpg";
          audioFileId = null;
          slug = "exclusive-interview-dfinity-researcher";
          published = true;
          category = "Politics";
        },
      ];
      for (article in sampleArticlesArray.values()) {
        articles.add(article.id, article);
      };
    };
  };
};
