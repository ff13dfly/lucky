import {useState,useEffect} from "react";

import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
//import Lucky from '../lib/lucky';
import Gene from "../lib/gene";

export default function Explorer() {
  const {siteConfig} = useDocusaurusContext();

  const self={
    fresh:async ()=>{
      //const list = await Lucky.get("name_list");
      //console.log(list);
      Gene.list((list)=>{
        console.log(list);
      });
    },
  }

  useEffect(() => {
    //console.log(`Here to go.`);
    self.fresh();
  },[]);

  return (
    <Layout
      title={`Home-${siteConfig.title}`}
      description="LuckySig overview <head />">
      <main>
        <div className='container'>hello</div>
        
      </main>
    </Layout>
  );
}