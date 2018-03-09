const db = require('./db')
const chalk = require('chalk');

class Migrate {
    async checkExistTable(table){
        let exist = await db.schema.hasTable(table)
        return exist;
    }

    
    async createAccountTable(){
        let exist = await this.checkExistTable("account")
        if(!exist) {
            return db.schema.createTable("account",function(t){
                t.increments('id').primary();
                t.bigInteger('user_id').notNullable()
                t.text('access_token').notNullable()
                t.text('cookie').notNullable()
                t.integer('num_invited').default(0)
                t.timestamps()
                console.log(chalk.green("Table Account created!!!"))
            })

        } else {
            console.log(chalk.blue('Table Account existed'))
        }
    }
    
    async createPostTable(){
        let exist = await this.checkExistTable("post")
        if(!exist) {
            return db.schema.createTable("post",function(t){
                t.increments('id').primary();
                t.bigInteger('post_id').notNullable()
                t.bigInteger('page_id').notNullable()
                t.integer('num_invited').default(0)
                t.timestamps()
                console.log(chalk.green("Table Post created!!!"))
            })

        } else {
            console.log(chalk.blue('Table Post existed'))
        }        
    }
    async run(){
       await this.createAccountTable()
       await this.createPostTable();
       await db.destroy()
    }
}

let migrate = new Migrate()
migrate.run()