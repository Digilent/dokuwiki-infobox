<?php
/********************************************************************************************************************************
*
* Dokuwiki Infobox by Digilent
*
* Written By Sam Kristoff
*
* www.github.com/digilent/dokuwiki-infobox
* www.digilent.com
*
/*******************************************************************************************************************************/
  
 
// must be run within DokuWiki
if(!defined('DOKU_INC')) die();
 
if(!defined('DOKU_PLUGIN')) define('DOKU_PLUGIN',DOKU_INC.'lib/plugins/');
require_once DOKU_PLUGIN.'syntax.php';

// Using PEAR Templates
require_once "HTML/Template/IT.php";
 
/********************************************************************************************************************************
* All DokuWiki plugins to extend the parser/rendering mechanism
* need to inherit from this class
********************************************************************************************************************************/
class syntax_plugin_digilentinfobox extends DokuWiki_Syntax_Plugin 
{
	//Return Plugin Info
	function getInfo() 
	{
        return array('author' => 'Sam Kristoff',
                     'email'  => 'admin@digilent.com',
                     'date'   => '2016-04-06',
                     'name'   => 'Digilent Infobox',
                     'desc'   => 'Dokuwiki Infobox by Digilent',
                     'url'    => ' www.github.com/digilent/dokuwiki-infobox');
    }	
	
	//Store user variables to parse in one pass
	protected $category = '';
	protected $product = '';
	protected $layout = '';

	protected $storeUrl = '';
	protected $gettingStartedUrl = '';
	protected $refManUrl = '';
	protected $refManName = '';
	protected $supportUrl = '';
	protected $primaryImage = '';
	protected $title = '';
	protected $subtitle = '';
	protected $data = '';
	protected $currentHeader = '';
	protected $fullrowCount = 0;
	protected $bulletCount = 0;
	 
    function getType() { return 'protected'; }
    function getSort() { return 32; }
  
    function connectTo($mode) {
        $this->Lexer->addEntryPattern('{{Digilent Infobox.*?(?=.*?}})',$mode,'plugin_digilentinfobox');
		
		//Add Internal Pattern Match For Product Page Elements	
		$this->Lexer->addPattern('\|.*?(?=.*?)\n','plugin_digilentinfobox');
    }
	
    function postConnect() {
      $this->Lexer->addExitPattern('}}','plugin_digilentinfobox');
    }
	 
    function handle($match, $state, $pos, Doku_Handler $handler) 
	{	
		
		switch ($state) 
		{
		
			case DOKU_LEXER_ENTER :
				break;
			case DOKU_LEXER_MATCHED :					
				//Find The Token And Value (Before '=' remove white space, convert to lower case).
				$tokenDiv = strpos($match, '=');											//Find Token Value Divider ('=')
				$prettyToken = trim(substr($match, 1, ($tokenDiv - 1)));					//Everything Before '=', Remove White Space
				$token = strtolower($prettyToken);											//Convert To Lower Case
				$value = trim(substr($match, ($tokenDiv + 1)));									//Everything after '='
				switch($token)
				{					
					case 'category':						
						$this->category = $value;
						break;
					case 'product':						
						$this->product = $value;
						break;
					case 'layout':						
						$this->layout = $value;
						break;					
						break;
					case 'store page':						
						$this->storeUrl = $value;
						break;
					case 'getting started':						
						$this->gettingStartedUrl = $value;
						break;
					case 'manual':
						// If value starts with https treat it as an external link, otherwise treat it as an internal link
						if(substr($value, 0, 4) == "http")
						{
							$this->refManUrl = $value;
							break;
						}

						if(getNS($value) != "")
						$value = str_replace(array("[", "]"), "", $value);	//Remove Brackets
						$value = str_replace(array("/"), ":", $value);		//Replace '/' with ':'
						if(getNS($value) != "")
						{
							//Absolute Path
							$this->refManUrl = wl($value);
						}
						else
						{	
							//Relative Path
							global $ID;
							resolve_pageid(getNS($ID), $value, $exists, "", false);		//Update value with resolved page id
							$this->refManUrl = wl($value);
						}
						break;
					case 'manual name':						
						$this->refManName = $value;
						break;
					case 'support':						
						$this->supportUrl = $value;
						break;
					case 'image':						
						$this->primaryImage = $value;
						break;
					case 'title':						
						$this->title = $value;
						break;
					case 'subtitle':						
						$this->subtitle = $value;
						break;
					case 'header':
						if (!is_array($this->data)) {
							$this->data = array();
						}

						$this->data[$value] = array();
						$this->currentHeader = $value;						
						break;
					case 'full row':						
						if (!is_array($this->data)) {
							$this->data = array();
						}

						if (!is_array($this->data[$this->currentHeader])) {
							$this->data[$this->currentHeader] = array();
						}
						$this->data[$this->currentHeader]["fullrow" . $this->fullRowCount] = substr(p_render('xhtml',p_get_instructions($value), $info, ""), 4, -5);
						$this->fullRowCount++;
						break;
					case 'bullet':
						if (!is_array($this->data)) {
							$this->data = array();
						}

						if (!is_array($this->data[$this->currentHeader])) {
							$this->data[$this->currentHeader] = array();
						}
						$this->data[$this->currentHeader]["bullet" . $this->bulletCount] = substr(p_render('xhtml',p_get_instructions($value), $info, ""), 4, -5);
						$this->bulletCount++;
						break;					
					default:
						if (!is_array($this->data)) {
							$this->data = array();
						}

						if (!is_array($this->data[$this->currentHeader])) {
							$this->data[$this->currentHeader] = array();
						}

						$this->data[$this->currentHeader][$prettyToken] = substr(p_render('xhtml',p_get_instructions($value), $info, ""), 4, -5); 
						break;
				}
				return array($state, $value);
				break;
			case DOKU_LEXER_UNMATCHED :
				break;
			case DOKU_LEXER_EXIT :
								
				//----------Process User Data Into Infobox----------

				$output = '';

				//Pull from product database if user specifies category and product
				if($this->category != "")
				{					
					$productNoWhiteSpace = preg_replace('/\s+/', '', $this->product);
				
					//$output .= "<div id='" . $this->category . "'>" ;
					//$output .= "<div id='" . $this->product . "'>" ;					
					$output .= "<div id='digilent-infobox' class='infobox digilent-infobox hidden' category='" . $this->category . "' product='" . $this->product . "' layout='" . rawurlencode($this->layout) . "'>Infobox Placeholder</div>";
					$output .= "</div>" ; 
					$output .= "</div>" ;	 
				}
				else 
				{
					//Generate table from user specified values

					//Load HTML Template
					$infoboxTpl = new HTML_Template_IT(dirname(__FILE__) . "/templates");
					$infoboxTpl->loadTemplatefile("infobox.tpl.html", true, true);
					
					//Set Store Button If Specified				
					if($this->storeUrl != '')
					{
						$infoboxTpl->setCurrentBlock("STOREBUTTON");
						$infoboxTpl->setVariable("NAME", "Buy");	
						$infoboxTpl->setVariable("URL", $this->storeUrl);
						$infoboxTpl->parseCurrentBlock("STOREBUTTON");
					}

					//Set Getting Started Button If Specified				
					if($this->gettingStartedUrl != '')
					{
						$infoboxTpl->setCurrentBlock("GETTINGSTARTEDBUTTON");
						$infoboxTpl->setVariable("NAME", "Getting Started");	
						$infoboxTpl->setVariable("URL", $this->gettingStartedUrl);
						$infoboxTpl->parseCurrentBlock("GETTINGSTARTEDBUTTON");
					}
					
					//Set Ref Manual Button If Specified				
					if($this->refManUrl != '')
					{
						//Set default name if none is specified
						if($this->refManName == '') 
						{
							$this->refManName = 'Reference Manual';
						}

						// URL
						$infoboxTpl->setCurrentBlock("REFMANBUTTON");
						$infoboxTpl->setVariable("NAME", $this->refManName);	
						$infoboxTpl->setVariable("URL", $this->refManUrl);
						$infoboxTpl->parseCurrentBlock("REFMANBUTTON");
					}
					
					//Set Support Button If Specified				
					if($this->supportUrl != '')
					{
						$infoboxTpl->setCurrentBlock("SUPPORTBUTTON");
						$infoboxTpl->setVariable("NAME", "Technical Support");	
						$infoboxTpl->setVariable("URL", $this->supportUrl);
						$infoboxTpl->parseCurrentBlock("SUPPORTBUTTON");
					}
						
					//Set Title If Specified
					if($this->title != '')
					{
						$infoboxTpl->setCurrentBlock("TITLEBLOCK");
						$infoboxTpl->setVariable("TITLE", $this->title);
						if($this->subtitle)
						{
							$infoboxTpl->setVariable("SUBTITLE", $this->subtitle);
						}
						$infoboxTpl->setVariable("TITLE", $this->title);
						$infoboxTpl->parseCurrentBlock("TITLEBLOCK");
					}
					
					
					
					//Iterate over sections
					foreach($this->data as $header => $section)
					{					
						foreach($section as $name => $value)
						{
							//Set and parse 'Full Row'
							if(strpos($name, 'fullrow') !== FALSE)
							{
								$infoboxTpl->setCurrentBlock("FULLROW");
								$infoboxTpl->setVariable("VALUE", $value);
								$infoboxTpl->parseCurrentBlock("FULLROW");
							}
							//Set and parse 'Bullet'
							else if(strpos($name, 'bullet') !== FALSE)
							{
								$infoboxTpl->setCurrentBlock("BULLETROW");
								$infoboxTpl->setVariable("VALUE", $value);
								$infoboxTpl->parseCurrentBlock("BULLETROW");
							}
							//Set and parse key value pairs
							else
							{
								$infoboxTpl->setCurrentBlock("NAMEVALUEROW");
								$infoboxTpl->setVariable("NAME", $name);
								$infoboxTpl->setVariable("VALUE", $value);
								$infoboxTpl->parseCurrentBlock("NAMEVALUEROW");						
							}
						}
						
						//Add Section Header If One Exists					
						if($header !== '')
						{
							$infoboxTpl->setCurrentBlock("HEADER");
							$infoboxTpl->setVariable("VALUE", $header);
							$infoboxTpl->parseCurrentBlock("HEADER");
						}
						
						//Parse Section
						$infoboxTpl->setCurrentBlock("SECTION");
						$infoboxTpl->parseCurrentBlock("SECTION");					
					}	
					//Cache parsed data for rendering
					$output = $infoboxTpl->get();			
				}
					
				//Clear member variables 
				$this->category = '';
				$this->product = '';
			
				$this->storeUrl = '';
				$this->gettingStartedUrl = '';
				$this->refManUrl = '';
				$this->refManName = '';
				$this->supportUrl = '';
				$this->primaryImage = '';
				$this->title = '';
				$this->subtitle = '';
				$this->data = '';
				$this->currentHeader = '';
				$this->fullrowCount = 0;
				$this->bulletCount = 0;
								
				return array($state, $output);				
				break;
			case DOKU_LEXER_SPECIAL :
				break;
		}
		
		return array($state, $match);
    }
 
    function render($mode, Doku_Renderer $renderer, $data) 
	{
    // $data is what the function handle return'ed.
        if($mode == 'xhtml')
		{		
			
			$renderer->doc .= $this->fullName;
			switch ($data[0]) 
			{
			  case DOKU_LEXER_ENTER : 
				break;
			  case DOKU_LEXER_MATCHED :				
				break;
			  case DOKU_LEXER_UNMATCHED :
				break;
			  case DOKU_LEXER_EXIT :
			  
				//Extract cached render data and add to renderer
				$output = $data[1];				
				$renderer->doc .= $output;				
				break;
				
			  case DOKU_LEXER_SPECIAL :
				break;
			}			
            return true;
        }
        return false;
    }	
}