
var printf = require('printf');

class Terminal  {

  currentProfile: TransactionProfile;
  display: any;

  /*
   * w_id: Warehouse ID, as stored in database. We use a string type because the
   * TPC-C specification allows this to be any data type.
   */
  constructor(public w_id: number, display: any) {
    this.display = display;
    this.currentProfile = new MenuProfile(this);
    this.setProfile(this.currentProfile);
  }

  setProfile(profile: TransactionProfile) {
    this.currentProfile = profile;

    if (this.display !== null) {
      this.display.setContent(this.currentProfile.getScreen());
      this.display.parent.render(); /* Ask the containing screen to re-render itself. */
    }
  }

  getProfile(): TransactionProfile {
    return this.currentProfile;
  }

  setDisplay(display: any) {
    this.display = display;
  }
}

var terminals: Terminal[];

interface TransactionProfile {
  getScreen() : string;
  action();
}

class MenuProfile implements TransactionProfile {

  term: Terminal;

  constructor(term: Terminal) {
    var self = this;

    self.term = term;

    setTimeout(function(){
      self.action();
      }, 1000);
  }

  getScreen(): string {
    return menuScreen
  }

  action() {
    var self = this;

    setTimeout(function() {

      self.term.setProfile(new NewOrderProfile(self.term));

      }, 1000);
  }
}

class OrderLineItem {
  constructor(public i_id: number, public i_name: string,
              public supply_w_id: number, public quantity: number,
              public s_quantity: number, public branded_generic: string,
              public i_price: number, public amount: number) {
  }
}

class NewOrderProfile implements TransactionProfile {

  term: Terminal;  /* term.w_id is the terminal's warehouse */
  w_tax: number;
  d_id: number;
  d_tax: number;
  c_id: number;
  c_name: string;
  c_credit: string;
  c_discount: number;
  o_id: number;
  o_entry_d: Date;
  o_ol_cnt: number;
  ol_items: OrderLineItem[];

  constructor(term: Terminal) {

    var self = this;
    var i: number;

    self.term = term;

    this.w_tax = 0.10;
    this.d_id = 9;
    this.d_tax = 0.15;
    this.c_id = 99;
    this.c_name = 'Singh';
    this.c_credit = 'GC';
    this.c_discount = 0.40;
    this.o_id = 9999;
    this.o_entry_d = new Date();
    this.o_ol_cnt = 12;

    this.ol_items = [];

    for (i = 0; i < 15; ++i) {
      this.ol_items[i] = new OrderLineItem(i*1000, 'ITEM' + i, this.term.w_id,
                                            15-i, 9999, 'G', 200, 200*(15-i));
    }

    setTimeout(function() {
      self.action();
      }, 1000);
  }

  /*
   * Although I tried very hard, this screen layout may not agree with the
   * layout describe in Clause 2.4.3.5. I primarily used the screenshot under
   * Clause 2.4.3.1 as the guide.
   */
  getScreen(): string {

    var i: number;

    var out:string = newOrderScreen
                      .replace('Warehouse:     '        , printf('Warehouse: %4d', this.term.w_id))
                      .replace('Customer:     '         , printf('Customer: %4d', this.c_id))
                      .replace('Order Number:         ' , printf('Order Number: %8d', this.c_id))
                      .replace('District:   '           , printf('District: %2d', this.d_id))
                      .replace('Name:                 ' , printf('Name: %-16s', this.c_name))
                      .replace('Number of Lines:   '    , printf('Number of Lines: %2d', this.o_ol_cnt))
                      .replace('Credit:   '             , printf('Credit: %2s', this.c_credit, 2))
                      .replace('Discount:       '       , printf('Discount: %.4f', this.c_discount))
                      .replace('WTax:       '           , printf('WTax: %.4f', this.w_tax))
                      .replace('DTax:       '           , printf('DTax: %.4f', this.d_tax))
                      .replace('Order Date:           ' , printf('Order Date: %10s', this.d_tax))

    for (i = 0; i < 15; ++i) {
      out = out.replace(' ' + (i+11).toString() + '                                                                             ',
                         printf(' %6d %7d %-24s %3d %9d %2s %5.2f %6.2d         ',
                                this.ol_items[i].supply_w_id,
                                this.ol_items[i].i_id,
                                this.ol_items[i].i_name,
                                this.ol_items[i].quantity,
                                this.ol_items[i].s_quantity,
                                this.ol_items[i].branded_generic,
                                this.ol_items[i].i_price,
                                this.ol_items[i].amount));
    }

    return out;
  }

  action() {

    var self = this;

    setTimeout(function() {

      self.term.setProfile(new MenuProfile(self.term));

      }, 5000);
  }
}

/*******************
* Screen templates *
********************/

var menuScreen: string =
//       01234567890123456789012345678901234567890123456789012345678901234567890123456789
/*01*/ "|--------------------------------------------------------------------------------|\n"
/*02*/+"|                                                                                |\n"
/*03*/+"|                                      TPC-C                                     |\n"
/*04*/+"|                                                                                |\n"
/*05*/+"|                                                                                |\n"
/*06*/+"|                                                                                |\n"
/*07*/+"|                                                                                |\n"
/*08*/+"|                                                                                |\n"
/*10*/+"|                                                                                |\n"
/*11*/+"|                                                                                |\n"
/*12*/+"|                                                                                |\n"
/*13*/+"|                                                                                |\n"
/*14*/+"|                                    MENU SCREEN                                 |\n"
/*09*/+"|                                                                                |\n"
/*15*/+"|                                                                                |\n"
/*16*/+"|                                                                                |\n"
/*17*/+"|                                                                                |\n"
/*18*/+"|                                                                                |\n"
/*19*/+"|                                                                                |\n"
/*20*/+"|                                                                                |\n"
/*21*/+"|                                                                                |\n"
/*22*/+"|                                                                                |\n"
/*23*/+"|                                                                                |\n"
/*24*/+"|________________________________________________________________________________|\n"
;

var newOrderScreen: string =
//       01234567890123456789012345678901234567890123456789012345678901234567890123456789
/*01*/ "|--------------------------------------------------------------------------------|\n"
/*02*/+"|                                 New Order                                      |\n"
/*03*/+"| Warehouse:      District:    WTax:        DTax:                                |\n"
/*04*/+"| Customer:       Name:                   Credit:    Discount:                   |\n"
/*05*/+"| Order Number:          Number of Lines:    Order Date:            Total:       |\n"
/*06*/+"|                                                                                |\n"
/*07*/+"| Supp_W Item_Id Item_Name                Qty Stock_Qty BG Price   Amount        |\n"
/*08*/+"| 11                                                                             |\n"
/*09*/+"| 12                                                                             |\n"
/*10*/+"| 13                                                                             |\n"
/*11*/+"| 14                                                                             |\n"
/*12*/+"| 15                                                                             |\n"
/*13*/+"| 16                                                                             |\n"
/*14*/+"| 17                                                                             |\n"
/*15*/+"| 18                                                                             |\n"
/*16*/+"| 19                                                                             |\n"
/*17*/+"| 20                                                                             |\n"
/*18*/+"| 21                                                                             |\n"
/*19*/+"| 22                                                                             |\n"
/*20*/+"| 23                                                                             |\n"
/*21*/+"| 24                                                                             |\n"
/*22*/+"| 25                                                                             |\n"
/*23*/+"| ItemNotFoundMessage                                                            |\n"
/*24*/+"|________________________________________________________________________________|\n"
;